@echo off
rem Navigate to the assets/videos directory
cd assets\videos

rem Loop through all MP4 files in the directory
for %%a in (*.mp4) do (
    echo Compressing %%a...
    ffmpeg -i "%%a" -vcodec libx265 -crf 28 "compressed_%%~na.mp4"
    echo Finished compressing %%a
)

echo All videos compressed successfully!
pause
