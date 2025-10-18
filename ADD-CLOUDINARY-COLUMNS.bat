@echo off
echo ========================================
echo   ADD CLOUDINARY COLUMNS TO DATABASE
echo ========================================
echo.
echo This will add two columns to blog_posts table:
echo   1. image_public_id - Stores Cloudinary image ID
echo   2. image_urls - Stores optimized image URLs
echo.
echo This allows images to be saved in Cloudinary
echo instead of directly in the database.
echo.
pause

echo.
echo Running script...
echo.

node add-cloudinary-columns.js

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo If successful, you should see:
echo   - image_public_id column added
echo   - image_urls column added
echo.
echo Next: Try creating a blog post with an image!
echo.
pause
