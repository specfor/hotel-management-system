import { validateUsername, validatePassword } from "@src/models/userModel";
import { expect, test, describe } from "vitest";

describe("User Model Validation Tests", () => {
  describe("validateUsername", () => {
    test("should accept valid usernames", () => {
      expect(validateUsername("john_doe")).toBe(true);
      expect(validateUsername("user123")).toBe(true);
      expect(validateUsername("test_user_2024")).toBe(true);
      expect(validateUsername("abc")).toBe(true); // minimum 3 chars
    });

    test("should reject invalid usernames", () => {
      expect(validateUsername("ab")).toBe(false); // too short
      expect(validateUsername("a".repeat(21))).toBe(false); // too long
      expect(validateUsername("user@name")).toBe(false); // special char
      expect(validateUsername("user name")).toBe(false); // space
      expect(validateUsername("user-name")).toBe(false); // hyphen
    });
  });

  describe("validatePassword", () => {
    test("should accept valid passwords", () => {
      const result1 = validatePassword("Password123");
      expect(result1.valid).toBe(true);
      expect(result1.message).toBeUndefined();

      const result2 = validatePassword("MySecure9Pass");
      expect(result2.valid).toBe(true);
    });

    test("should reject password with less than 8 characters", () => {
      const result = validatePassword("Pass1");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Password must be at least 8 characters");
    });

    test("should reject password without uppercase letter", () => {
      const result = validatePassword("password123");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Password must contain at least one uppercase letter");
    });

    test("should reject password without lowercase letter", () => {
      const result = validatePassword("PASSWORD123");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Password must contain at least one lowercase letter");
    });

    test("should reject password without number", () => {
      const result = validatePassword("PasswordOnly");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Password must contain at least one number");
    });
  });
});
