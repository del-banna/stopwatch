/*

JSON Object Structure

{
    "configuration": {
        "dynamicURL": true,
        "concurrency": false
    },
    "stopwatches": [
        {
            "name": "new stopwatch",
            "time": 0
        },
        {
            "name": "new stopwatch (1)",
            "time": 0
        }
    ]
}

Partial imports and exports may omit operation-irrelevant or untargetted parts while obeying the base structure.
Example of a partial import for a single stopwatch:
{
    "stopwatches": [
        {
            "name": "new stopwatch (2)",
            "time": 0
        }
    ]
}

*/

