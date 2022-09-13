const util = require('util');
const getPathValue  = require('@walcu-engineering/getpathvalue');
const isJsonPointer = require('@walcu-engineering/isjsonpointer');
const isAncestor    = require('@walcu-engineering/isancestor');

/**
 * Given a change to the path '/a/b', if the pathHasChanged function is called
 * for the path 'a/b/c/d' we cannot determine if that path has actually
 * changed or not by just checking the changes paths.
 *
 * In order to resolve this we have to check if there is a change whose's path
 * is an ancestor of the requested path. If this is the case, then we have to
 * take the whole ancestor's old value, and compare the nested old value with
 * the current nested old value and check if it is the same in order to
 * determine if the requested path has changed or not.
 *
 * @param path: String with the format JSON pointer as defined in RFC6901
 */
const pathHasChanged = (doc = {}, changes = [], path = '') => {
  if(!isJsonPointer(path)){
    throw new Error(`${path} is not a JSON pointer path`);
  }
  const exact_change = changes.find(change => change.path === path); //This should be the most common case
  if(exact_change) return true;
  //Ok, we are not lucky so we have to check if there is any change whose's
  //path is an ancestor for the requested path. Example change's path is /a/b
  //and the requested path is /a/b/c
  const ancestor_changes = changes.filter(change => isAncestor(change.path, path));
  //If there are several changes that affect to ancestors, we have to check
  //all the changes because if the nearest ancestor has not the change, it
  //does not mean that another change that is a farther ancestor includes
  //a change for the nested path.
  const ancestor_changes_have_affected_to_path = ancestor_changes.some(ancestor_change => {
    //Now the old_value of the ancestor_change is where we have to
    //check if the value has changed or not, but now we cannot use the
    //requested path because if the requested path was '/a/b/c/d/e' and
    //the ancestor path is '/a/b/c', we have to check the subpath
    //'/d/e'. So we have to extract the subpath from the requested path.
    //In the case where the ancestor change is for the root path (''),
    //then we have to keep the requested path
    const subpath = ancestor_change.path ? path.split(ancestor_change.path)[1] : path;
    //Once we have the subpath, we have to read the old value, and we need
    //a function in order to achieve this because we have to take into
    //account this scenario:
    //old value for path '/a/b/c' is {d: {e: 1}}; but the requested subpath
    //is /d/e/f' that path does not exist in old value, so we need a mechanism
    //that given that path returns undefined.
    const old_subpath_value = getPathValue(ancestor_change.old_value, subpath);
    //Now we have to compare the old value with the current one to determine if
    //the value has changed or not.
    const current_nested_value = getPathValue(doc, path);
    return !util.isDeepStrictEqual(current_nested_value, old_subpath_value);
  });
  if(ancestor_changes_have_affected_to_path) return true//This is a shortcut to avoid the next calculations
  //now we have to ckeck the other case, this means that the requested path
  //is longer than the change's path. Example, change's path is /a/b/c/d
  //but the requested path is /a/b. In this case the path /a/b has changed
  //because there is a change that affects to a descendant path. But we have not
  //guarantees that this means an actual change because it is possible that the new
  //value given to /a/b/c/d was the same value than the previous value given to
  //that path. So we are doomed to check the equality aswel, like in the first
  //conditional
  const descendant_changes = changes.filter(change => isAncestor(path, change.path));
  if(descendant_changes.length > 0){//there are changes that are descendants of the requested path
    return descendant_changes.some(descendant_change => {
      //Now the old_value of the descendant_change is where we have to
      //check if the value has changed or not, comparing it to the
      //current change's path value. If change's path is /a/b/c/d
      //we have to check the current value for that path, and compare
      //it with the old_value to ensure that the change's value has actually changed
      //And this has to be made this way because it is nearly impossible to read
      //the new value given to a path inside the Proxy.
      const current_value_of_change_path = getPathValue(doc, descendant_change.path);
      return !util.isDeepStrictEqual(current_value_of_change_path, descendant_change.old_value);
    });
  }
  return false;//there are not changes that are descendants of the requested path, and there are not any more options, so the requested path has not changed.
}
module.exports = pathHasChanged;
