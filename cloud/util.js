exports.getCurrentHour = function() 
{
  var now = new Date();
    return now.getHours()-3;
}

exports.cleanString = function(str) 
{
  // remove accents, swap ñ for n, etc
  var from = "ãàáäâèéëêìíïîòóöôõùúüûñç·/_,:;";
  var to   = "aaaaaeeeeiiiiooooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str;
}

exports.removeAccents = function(str) 
{
  // remove accents, swap ñ for n, etc
  var from = "ãàáäâèéëêìíïîòóöôõùúüûñç";
  var to   = "aaaaaeeeeiiiiooooouuuunc";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str;
}

exports.arrayContains = function(array, element) 
{
    if (array.indexOf(element) == -1) {
        return false;
    };
    return true;
}

exports.loggerBlock = function(response) 
{
    return {
        success: function(success) {
            console.log(success.message);
            response.success(success.message);
        },
        error: function(error) {
            console.log(error.message);
            response.error(error.message);
        }
    };
}