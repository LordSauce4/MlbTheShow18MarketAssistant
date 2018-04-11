function cleanNumberString(numberString) {
    return Number(numberString.replace(/\D/g, ""));
}