"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = require("@src/models/userModel");
const vitest_1 = require("vitest");
(0, vitest_1.test)("create new user test", () => {
    (0, vitest_1.expect)((0, userModel_1.addNewUser2)()).toEqual({ user: "hola" });
});
