exports.addZeros = function (_amt, _total) {
  var amountLength = String(_amt).length;

  var zerosToAdd = parseInt(_total) - parseInt(amountLength);

  console.log(zerosToAdd);

  var zeros = "";

  //zerobuilder
  for (i = 0; i != parseInt(zerosToAdd); i++) {
    zeros += "0";
  }

  var daiNum = String(_amt) + String(zeros);

  console.log(daiNum);

  return daiNum;
};
