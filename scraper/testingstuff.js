const params = {
  q: 'jobTitle',
  l: 'location',
  jk: 'jobKey',
};

function stringKeyVals(obj) {
  const pairsAsStr = [];
  const keyArr = Object.keys(obj);

  keyArr.forEach((key) => {
    const keyString = `${key}`;
    const val = obj[`${key}`];

    pairsAsStr.push(`${key}=${val}`);
  });
  return pairsAsStr.join('&');
}

console.log(stringKeyVals(params));
