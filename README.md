# pathHasChanged
Function that returns a boolean if the given path has changed

## API
### `pathHasChanged(object, diffs, path)`
Describing the params list:

**object**: The target object from who we want to read the previous value for the given path. Default value empty object.

**diffs**: Array of differences ordered from most recent to least recent, diffs[0] is the most recent one (Default value empty array). Each difference is an object with the following keys:

- path: [mandatory] A string following the JSON Pointer format defined by the RFC 6901
- old_value: [optional] any value.

## Examples
The best way to se examples, is to check the file `index.test.js`. There you are going to fully understand how this works, and you can understand even beyond if you read the implementation, because it is fully commented.
