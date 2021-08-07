import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";
import OneCron, { cronValidate } from "../src";

Enzyme.configure({ adapter: new Adapter() });

it("renders the correct language when lang prop is English", () => {
  const cronOne = Enzyme.shallow(
    <OneCron showCheckbox={true} lang='Chinese' cronExpression='0 0 2 * * ?' />
  );
  expect(cronOne.find(".timing").text()).toEqual("定时");
});

it("checkbox not show when showCheckbox is false", () => {
  const cronOne = Enzyme.render(<OneCron showCheckbox={false} />);
  expect(cronOne.find(".ant-checkbox-input").length).toEqual(0);
});

it("renders the correct text when cronExpression is given", () => {
  const cronOne = Enzyme.render(
    <OneCron showCheckbox={true} lang='English' cronExpression='0 0 2 * * ?' />
  );
  expect(cronOne.find(".ant-time-picker-input").prop("value")).toEqual("02:00");
});

it("renders the correct text when showRecentTime is true", () => {
  const cronOne = Enzyme.render(
    <OneCron showRecentTime={true} cronExpression='0 0 2 * * ?' />
  );
  expect(cronOne.find(".recent-title").text()).toEqual(
    "Recently generated time"
  );
});

it("dayOfWeekOneBased prop is true by default", () => {
  const cronExpression = '0 0 2 ? * 1,7';
  const cronOne = Enzyme.render(
    <OneCron cronExpression={cronExpression} />
  );
  expect(cronOne.find(".errorCronExp").length).toBe(0);
  // 应该选中周日和周六
  expect(cronOne.find('.schedule-period.week .cron-select-wrapper .ant-select-selection__choice__content').text()).toBe('SunSat');
});

it("dayOfWeekOneBased prop is false", () => {
  const cronExpression = '0 0 2 ? * 0,6';
  const cronOne = Enzyme.render(
    <OneCron cronExpression={cronExpression} dayOfWeekOneBased={false} />
  );
  expect(cronOne.find(".errorCronExp").length).toBe(0);
  // 应该选中周日和周六
  expect(cronOne.find('.schedule-period.week .cron-select-wrapper .ant-select-selection__choice__content').text()).toBe('SunSat');
});

describe('cronValidate', () => {
  it('week schedule', () => {
    expect(cronValidate('0 0 2 ? * 1,2,3,4,5,6,7')).toBe(true);
    expect(cronValidate('0 0 2 ? * 0,8')).toBe(false);
    expect(cronValidate('0 0 2 ? * 0,1,2,3,4,5,6', false)).toBe(true);
    expect(cronValidate('0 0 2 ? * 7,8', false)).toBe(false);
    // cronValidate函数支持dayOfWeek字段是SUN,MON这种格式，但是OneCron组件并不支持这种格式，只支持像1,2这种数据格式
    expect(cronValidate('0 0 2 ? * SUN,MON,TUE,WED,THU,FRI,SAT')).toBe(true);
    // 测试strictValidate默认为true
    expect(cronValidate('0 0 2 ? * 6,0', false)).toBe(false);
    // 测试strictValidate为false
    expect(cronValidate('0 0 2 ? * 6,0', false, false)).toBe(true);
  });
});

describe('recentTimeNum prop', () => {
  it('recentTimeNum by default', () => {
    const cronExpression = '0 0 1 * * ?';
    const cronOne = Enzyme.render(
      <OneCron cronExpression={cronExpression} showRecentTime={true} />
    );
    // 默认展示5个最近调度时间
    expect(cronOne.find(".recent > ul > li").length).toBe(5);
  });
  
  it('recentTimeNum is 3', () => {
    const cronExpression = '0 0 1 * * ?';
    const cronOne = Enzyme.render(
      <OneCron cronExpression={cronExpression} recentTimeNum={3} showRecentTime={true} />
    );
    // 展示3个最近调度时间
    expect(cronOne.find(".recent > ul > li").length).toBe(3);
  });
});

describe('twoHourItemsRequired prop', () => {
  it('twoHourItemsRequired is false (by default)', async () => {
    const cronExpression = '0 0 1,2 * * ?';
    const errorMessage = 'test error message';
    const cronOne = Enzyme.mount(
      <OneCron cronExpression={cronExpression} showRecentTime={true} errorMessage={errorMessage} />
    );
    // 点击时间点的“1时”删除按钮，删除“1时”选项，此时只剩下“2时”选项
    cronOne.find('.ant-select-selection__choice__remove').first().simulate('click');
    // 等待antd Select动画结束
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      } , 2000);
    });
    cronOne.update();
    // twoHourItemsRequired默认为false，时间点只选择了一项时，不报错
    expect(cronOne.find('.cron-select-errorMessage').length).toBe(0);
  });
  
  it('twoHourItemsRequired is true', async () => {
    const cronExpression = '0 0 1,2 * * ?';
    const errorMessage = 'test error message';
    const cronOne = Enzyme.mount(
      <OneCron cronExpression={cronExpression} showRecentTime={true} errorMessage={errorMessage} twoHourItemsRequired={true} />
    );
    // 点击时间点的“1时”删除按钮，删除“1时”选项，此时只剩下“2时”选项
    cronOne.find('.ant-select-selection__choice__remove').first().simulate('click');
    // 等待antd Select动画结束
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      } , 2000);
    });
    cronOne.update();
    // twoHourItemsRequired为true，时间点只选择了一项时，报错
    expect(cronOne.find('.cron-select-errorMessage').text()).toBe(errorMessage);
  });
});
