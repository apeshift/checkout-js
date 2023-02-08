export function camelize(obj: any) : any {
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, k) => ({ ...acc, [camelize(k)]: camelize(obj[k]) }), {})
  }

  if (typeof obj === 'string' || obj instanceof String) {
    return obj.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
  
  return obj
}