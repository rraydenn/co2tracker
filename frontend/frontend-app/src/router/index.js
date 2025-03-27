"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_router_1 = require("vue-router");
var Login_vue_1 = __importDefault(require("../views/Login.vue"));
var Register_vue_1 = __importDefault(require("../views/Register.vue"));
var Dashboard_vue_1 = __importDefault(require("../views/Dashboard.vue"));
var routes = [
    { path: "/", component: Login_vue_1.default },
    { path: "/login", component: Login_vue_1.default },
    { path: "/register", component: Register_vue_1.default },
    { path: "/dashboard", component: Dashboard_vue_1.default },
];
var router = (0, vue_router_1.createRouter)({
    history: (0, vue_router_1.createWebHistory)(),
    routes: routes,
});
exports.default = router;
