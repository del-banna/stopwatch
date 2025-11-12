import sys
import subprocess
import traceback

# google chrome directory must be in PATH
chromePath = "chrome"
pageURL = "https://skr10s.000webhostapp.com/stopwatches/main"

def launch(data:str=None, appMode:bool=True):
    arg = f"{'--app=' if appMode else ''}{pageURL}?list={data}"
    subprocess.call([chromePath, arg])

if __name__ == "__main__":
    args = sys.argv

    if len(args) == 1:
        exit()

    data = None
    try:
        filePath = sys.argv[1]
        file = open(filePath, 'r')
        data = file.read()
        file.close()
    except Exception:
        traceback.print_exc()
        exit()
    appMode = True
    
    if len(args) >= 3:
        appMode = bool(args[2])
    
    launch(data, appMode)

