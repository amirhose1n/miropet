import { yupResolver } from "@hookform/resolvers/yup";
import { Add, ArrowBack, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import ImageKitUpload from "../components/ImageKitUpload";
import apiService from "../services/api";
import { ICategory, ProductFormData } from "../types";

const schema = yup.object({
  name: yup.string().required("نام محصول الزامی است"),
  description: yup.string(),
  brand: yup.string(),
  category: yup
    .array()
    .of(yup.string())
    .min(1, "حداقل یک دسته‌بندی الزامی است"),
  isFeatured: yup.boolean(),
  variations: yup
    .array()
    .of(
      yup.object({
        color: yup.string(),
        size: yup.string(),
        price: yup
          .number()
          .min(0, "قیمت باید مثبت باشد")
          .required("قیمت الزامی است"),
        discount: yup
          .number()
          .min(0, "تخفیف باید مثبت باشد")
          .test(
            "discount-less-than-price",
            "تخفیف باید کمتر از قیمت باشد",
            function (value) {
              if (!value) return true; // discount is optional
              const price = this.parent.price;
              return value < price;
            }
          ),
        weight: yup.string(),
        stock: yup
          .number()
          .min(0, "موجودی باید مثبت باشد")
          .required("موجودی الزامی است"),
        images: yup
          .array()
          .of(yup.string())
          .min(1, "حداقل یک آدرس تصویر الزامی است"),
      })
    )
    .min(1, "حداقل یک تنوع الزامی است"),
});

const ProductForm: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [showCreateOption, setShowCreateOption] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const isEdit = Boolean(id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    //@ts-ignore
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: [],
      isFeatured: false,
      variations: [
        {
          color: "",
          size: "",
          price: 0,
          discount: 0,
          weight: "",
          stock: 0,
          images: [""],
        },
      ],
    },
  });

  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({
    control,
    name: "variations",
  });

  const watchedCategories = watch("category");

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [id, isEdit]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getProductById(productId);
      if (response.success && response.data) {
        const product = response.data.product;
        reset({
          name: product.name,
          description: product.description || "",
          brand: product.brand || "",
          category: product.category,
          isFeatured: product.isFeatured,
          variations: product.variations,
        });
      }
    } catch (error) {
      enqueueSnackbar("دریافت اطلاعات محصول ناموفق بود", { variant: "error" });
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      let response;

      if (isEdit && id) {
        response = await apiService.updateProduct(id, data);
      } else {
        response = await apiService.createProduct(data);
      }

      if (response.success) {
        enqueueSnackbar(
          `محصول با موفقیت ${isEdit ? "بروزرسانی" : "ایجاد"} شد`,
          { variant: "success" }
        );
        navigate("/products");
      }
    } catch (error) {
      enqueueSnackbar(`${isEdit ? "بروزرسانی" : "ایجاد"} محصول ناموفق بود`, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryInputChange = (value: string) => {
    setCategoryInput(value);
    const categoryExists = categories.some(
      (cat) => cat.name.toLowerCase() === value.toLowerCase()
    );
    setShowCreateOption(value.trim() !== "" && !categoryExists);
  };

  const createAndAddCategory = async () => {
    if (!categoryInput.trim()) return;

    try {
      setCreatingCategory(true);
      const response = await apiService.createCategory({
        name: categoryInput.trim(),
      });

      if (response.success && response.data) {
        fetchCategories();
        if (!watchedCategories.includes(response.data.category.name)) {
          setValue("category", [
            ...watchedCategories,
            response.data.category.name,
          ]);
        }
        setCategoryInput("");
        setShowCreateOption(false);
        enqueueSnackbar("دسته‌بندی جدید ایجاد شد", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("ایجاد دسته‌بندی ناموفق بود", { variant: "error" });
    } finally {
      setCreatingCategory(false);
    }
  };

  const addExistingCategory = (categoryName: string) => {
    if (!watchedCategories.includes(categoryName)) {
      setValue("category", [...watchedCategories, categoryName]);
    }
    setCategoryInput("");
    setShowCreateOption(false);
  };

  const removeCategory = (categoryToRemove: string) => {
    setValue(
      "category",
      watchedCategories.filter((cat) => cat !== categoryToRemove)
    );
  };

  const addVariation = () => {
    appendVariation({
      color: "",
      size: "",
      price: 0,
      discount: 0,
      weight: "",
      stock: 0,
      images: [""],
    });
  };

  const addImageToVariation = (variationIndex: number) => {
    const currentImages = watch(`variations.${variationIndex}.images`);
    setValue(`variations.${variationIndex}.images`, [...currentImages, ""]);
  };

  const removeImageFromVariation = (
    variationIndex: number,
    imageIndex: number
  ) => {
    const currentImages = watch(`variations.${variationIndex}.images`);
    if (currentImages.length > 1) {
      setValue(
        `variations.${variationIndex}.images`,
        currentImages.filter((_, i) => i !== imageIndex)
      );
    }
  };

  if (loading && isEdit) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate("/products")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {isEdit ? "ویرایش محصول" : "افزودن محصول جدید"}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {isEdit
              ? "اطلاعات محصول را بروزرسانی کنید"
              : "محصول جدید برای فروشگاه خود ایجاد کنید"}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                اطلاعات پایه
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("name")}
                fullWidth
                label="نام محصول"
                placeholder="نام محصول را وارد کنید"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={disabled}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("brand")}
                fullWidth
                label="برند"
                placeholder="برند محصول را وارد کنید"
                error={!!errors.brand}
                helperText={errors.brand?.message}
                disabled={disabled}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("description")}
                fullWidth
                label="توضیحات"
                placeholder="توضیحات کامل محصول را وارد کنید"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={disabled}
              />
            </Grid>

            {/* Categories */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                دسته‌بندی‌ها
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  value={categoryInput}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  fullWidth
                  label="انتخاب یا افزودن دسته‌بندی"
                  placeholder="نام دسته‌بندی را تایپ کنید"
                  disabled={disabled}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (showCreateOption) {
                        createAndAddCategory();
                      }
                    }
                  }}
                />

                {/* Category suggestions dropdown */}
                {categoryInput && (
                  <Paper
                    sx={{
                      mt: 1,
                      maxHeight: 200,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <List dense>
                      {/* Show existing categories that match the input */}
                      {categories
                        .filter((cat) =>
                          cat.name
                            .toLowerCase()
                            .includes(categoryInput.toLowerCase())
                        )
                        .map((category) => (
                          <ListItem
                            key={category._id}
                            button
                            onClick={() => addExistingCategory(category.name)}
                          >
                            <ListItemText primary={category.name} />
                          </ListItem>
                        ))}

                      {/* Show create option if category doesn't exist */}
                      {showCreateOption && (
                        <ListItem
                          button
                          onClick={createAndAddCategory}
                          disabled={creatingCategory}
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            "&:hover": {
                              bgcolor: "primary.main",
                            },
                          }}
                        >
                          <ListItemText
                            primary={`افزودن "${categoryInput}"`}
                            secondary={
                              creatingCategory
                                ? "در حال ایجاد..."
                                : "دسته‌بندی جدید ایجاد کنید"
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>

              {/* Selected categories */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {watchedCategories && watchedCategories.length
                  ? watchedCategories.map((category, index) => (
                      <Chip
                        key={index}
                        label={category}
                        onDelete={() => removeCategory(category)}
                        color="primary"
                        disabled={disabled}
                      />
                    ))
                  : null}
              </Box>
              {errors.category && (
                <Typography color="error" variant="caption">
                  {errors.category.message}
                </Typography>
              )}
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch {...register("isFeatured")} />}
                label="محصول ویژه"
                disabled={disabled}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                تنوع‌های محصول
              </Typography>
            </Grid>

            {/* Variations */}
            {variationFields &&
              variationFields.length &&
              variationFields.map((field, variationIndex) => (
                <Grid item xs={12} key={field.id}>
                  <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1">
                        تنوع {variationIndex + 1}
                      </Typography>
                      {variationFields.length > 1 && (
                        <IconButton
                          onClick={() => removeVariation(variationIndex)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          {...register(`variations.${variationIndex}.color`)}
                          fullWidth
                          label="رنگ"
                          placeholder="مثل: قرمز، آبی"
                          size="small"
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          {...register(`variations.${variationIndex}.size`)}
                          fullWidth
                          label="سایز"
                          placeholder="مثل: کوچک، متوسط، بزرگ"
                          size="small"
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          {...register(`variations.${variationIndex}.price`)}
                          fullWidth
                          label="قیمت (تومان)"
                          placeholder="قیمت به تومان"
                          type="number"
                          size="small"
                          error={!!errors.variations?.[variationIndex]?.price}
                          helperText={
                            errors.variations?.[variationIndex]?.price?.message
                          }
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          {...register(`variations.${variationIndex}.discount`)}
                          fullWidth
                          label="تخفیف (تومان)"
                          placeholder="مقدار تخفیف"
                          type="number"
                          size="small"
                          error={
                            !!errors.variations?.[variationIndex]?.discount
                          }
                          helperText={
                            errors.variations?.[variationIndex]?.discount
                              ?.message
                          }
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          {...register(`variations.${variationIndex}.stock`)}
                          fullWidth
                          label="موجودی"
                          placeholder="تعداد موجود"
                          type="number"
                          size="small"
                          error={!!errors.variations?.[variationIndex]?.stock}
                          helperText={
                            errors.variations?.[variationIndex]?.stock?.message
                          }
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register(`variations.${variationIndex}.weight`)}
                          fullWidth
                          label="وزن"
                          placeholder="مثل: ۵۰۰ گرم، ۱ کیلوگرم"
                          size="small"
                          disabled={disabled}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          تصاویر
                        </Typography>
                        <Grid container spacing={2}>
                          {watch(`variations.${variationIndex}.images`)?.map(
                            (imageUrl, imageIndex) => (
                              <Grid item xs={12} md={6} lg={4} key={imageIndex}>
                                <Box sx={{ position: "relative" }}>
                                  <ImageKitUpload
                                    existingImageUrl={imageUrl}
                                    onUploadSuccess={(newImageUrl) => {
                                      const currentImages = watch(
                                        `variations.${variationIndex}.images`
                                      );
                                      const updatedImages = [...currentImages];
                                      updatedImages[imageIndex] = newImageUrl;
                                      setValue(
                                        `variations.${variationIndex}.images`,
                                        updatedImages
                                      );
                                    }}
                                    onRemove={() =>
                                      removeImageFromVariation(
                                        variationIndex,
                                        imageIndex
                                      )
                                    }
                                    disabled={disabled}
                                  />
                                  {watch(`variations.${variationIndex}.images`)
                                    .length > 1 && (
                                    <IconButton
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        color: "white",
                                        "&:hover": {
                                          backgroundColor: "rgba(0,0,0,0.7)",
                                        },
                                      }}
                                      size="small"
                                      onClick={() =>
                                        removeImageFromVariation(
                                          variationIndex,
                                          imageIndex
                                        )
                                      }
                                      disabled={disabled}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </Grid>
                            )
                          )}
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            startIcon={<Add />}
                            onClick={() => addImageToVariation(variationIndex)}
                            size="small"
                            variant="outlined"
                            disabled={disabled}
                          >
                            افزودن تصویر
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}

            <Grid item xs={12}>
              <Button
                startIcon={<Add />}
                onClick={addVariation}
                variant="outlined"
                fullWidth
                disabled={disabled}
              >
                افزودن تنوع
              </Button>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 4,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/products")}
                  disabled={loading}
                >
                  لغو
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : undefined
                  }
                >
                  {isEdit ? "بروزرسانی محصول" : "ایجاد محصول"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProductForm;
