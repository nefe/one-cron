import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";
import OneCron from "../src";

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
