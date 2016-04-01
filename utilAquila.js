function normalizeAddr(addr)
{
  var arr = addr.split('-');
  for(var i in arr)
  {
    if(arr[i].length === 1) arr[i] = '0' + arr[i];
  }
  addr = arr.join('');
  return addr;
}

module.exports = {
  normalizeAddr: normalizeAddr
};