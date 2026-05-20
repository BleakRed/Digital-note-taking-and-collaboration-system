"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.USE_SUPABASE = exports.supabaseBucket = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
exports.supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'notion-clone-files';
exports.USE_SUPABASE = !!(supabaseUrl && supabaseServiceRoleKey);
if (!exports.USE_SUPABASE) {
    console.warn('Supabase not configured. Local file storage will be used.');
}
exports.supabase = exports.USE_SUPABASE
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey)
    : null;
