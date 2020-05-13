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

exports.loseZeros = function (_longdai) {
  //get total length of characters
  var longdaiLength = String(_longdai).length;

  //find relevant digits minus zeros
  var digits = parseInt(longdaiLength) - 18 + 2;

  //find decimal index
  var dec = parseInt(longdaiLength) - 18;

  //the actual number minus decmial
  var daiString = _longdai.substring(0, digits);

  //get numbers in front of decimal
  var daiDecStringFront = daiString.substring(0, dec);
  //console.log("front " + daiDecStringFront);

  //get numbers after decimal
  var daiDecStringBack = daiString.substring(dec);
  //console.log("back " + daiDecStringBack);

  var DaiFinal = daiDecStringFront + "." + daiDecStringBack;

  return DaiFinal;
};
