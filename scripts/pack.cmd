@ECHO off

ECHO.
ECHO Packaging deployment files.

if NOT EXIST "%out_directory%" (
    ECHO Creating absent "out" directory.
    mkdir "%out_directory%"
    ECHO Created "out" directory.
    ECHO.
)

if NOT EXIST "%public_directory%" (
    ECHO Creating absent "public" directory.
    mkdir "%public_directory%"
    ECHO Created "public" directory.
    ECHO.
)

:: Copy build files to public directory
ECHO Packaging build files.
xcopy "%build_directory%\*" "%public_directory%" /E /I /Y
if %errorlevel% neq 0 (
    ECHO Packaging build files failed!
    exit /b %errorlevel%
)

ECHO Packaged build files.
ECHO.

:: Copy deployment assets to out directory
ECHO Packaging deployment assets.
robocopy "%deployment_assets_directory%" "%out_directory%" /E
if %errorlevel% GEQ 8 (
    ECHO Packaging deployment assets failed!
    exit /b %errorlevel%
)
ECHO Packaged deployment assets.
ECHO.


ECHO.
ECHO Finished packaging.
ECHO.

exit /b 0