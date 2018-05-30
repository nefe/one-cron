/**
 * 得到一个数组
 * @param length 数组长度
 * @param beginNum 第一个元素值
 */

function getArr(length: number, beginNum = 0, arr = []): number[] {
  if (length <= 0) {
    return arr;
  }

  return getArr(length - 1, beginNum + 1, [...arr, beginNum]);
}

export { getArr };
