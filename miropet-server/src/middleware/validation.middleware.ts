import { body } from "express-validator";

export const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("لطفاً یک ایمیل معتبر وارد کنید"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("رمز عبور باید حداقل ۶ کاراکتر باشد"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("نام باید بین ۲ تا ۵۰ کاراکتر باشد"),
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("لطفاً یک ایمیل معتبر وارد کنید"),
  body("password").notEmpty().withMessage("رمز عبور الزامی است"),
];

export const validateAdminCreation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("لطفاً یک ایمیل معتبر وارد کنید"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("رمز عبور باید حداقل ۸ کاراکتر باشد")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "رمز عبور باید شامل حداقل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر خاص باشد"
    ),
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("نام باید بین ۲ تا ۵۰ کاراکتر باشد")
    .notEmpty()
    .withMessage("نام برای کاربران مدیر الزامی است"),
];

export const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام محصول الزامی است")
    .isLength({ max: 200 })
    .withMessage("نام محصول نمی‌تواند بیش از ۲۰۰ کاراکتر باشد"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد"),
  body("category")
    .isArray({ min: 1 })
    .withMessage("حداقل یک دسته‌بندی الزامی است")
    .custom((categories) => {
      if (!Array.isArray(categories)) return false;
      return categories.every(
        (cat) => typeof cat === "string" && cat.trim().length > 0
      );
    })
    .withMessage("همه دسته‌بندی‌ها باید رشته‌های غیرخالی باشند"),
  body("brand")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("برند نمی‌تواند بیش از ۱۰۰ کاراکتر باشد"),
  body("variations")
    .isArray({ min: 1 })
    .withMessage("حداقل یک تنوع محصول الزامی است")
    .custom((variations: any[]) => {
      if (!Array.isArray(variations)) return false;
      return variations.every((variation: any) => {
        return (
          typeof variation === "object" &&
          variation !== null &&
          (variation.color === undefined ||
            (typeof variation.color === "string" &&
              variation.color.trim().length > 0)) &&
          (variation.size === undefined ||
            (typeof variation.size === "string" &&
              variation.size.trim().length > 0)) &&
          typeof variation.price === "number" &&
          variation.price > 0 &&
          (variation.weight === undefined ||
            (typeof variation.weight === "string" &&
              variation.weight.trim().length > 0)) &&
          typeof variation.stock === "number" &&
          Number.isInteger(variation.stock) &&
          variation.stock >= 0 &&
          Array.isArray(variation.images) &&
          variation.images.length >= 1 &&
          variation.images.every(
            (img: any) => typeof img === "string" && img.trim().length > 0
          )
        );
      });
    })
    .withMessage(
      "هر تنوع باید شامل قیمت مثبت، موجودی صحیح غیرمنفی و حداقل یک تصویر معتبر باشد"
    ),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("ویژه بودن باید مقدار بولی باشد"),
];
