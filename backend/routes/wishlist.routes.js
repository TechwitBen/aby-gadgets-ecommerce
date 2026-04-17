import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlistItem,
  clearWishlist,
} from "../controllers/wishlist.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const wishlistRouter = Router();

// All wishlist routes require the user to be logged in
wishlistRouter.use(isAuthenticated);

wishlistRouter.get("/",                       getWishlist);          // GET    /api/v1/wishlist
wishlistRouter.delete("/",                    clearWishlist);        // DELETE /api/v1/wishlist
wishlistRouter.post("/toggle/:productId",     toggleWishlistItem);   // POST   /api/v1/wishlist/toggle/:productId
wishlistRouter.post("/:productId",            addToWishlist);        // POST   /api/v1/wishlist/:productId
wishlistRouter.delete("/:productId",          removeFromWishlist);   // DELETE /api/v1/wishlist/:productId

export default wishlistRouter;