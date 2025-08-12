import type { Component } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

const Button: Component = (props) => {
  const [, otherProps] = splitProps(props, ["class", "classList", "secondary"]);

  const classCommon = `disabled:bg-frontier-gray rounded-sm border px-3 py-3
    font-medium enabled:cursor-pointer md:px-6`;
  const classPrimary = `bg-red-orange hover:bg-red-orange-light
    active:bg-red-orange-dark text-shuttle-white border-transparent`;
  const classSecondary = `bg-shuttle-white hover:bg-shuttle-white-light
    active:bg-shuttle-white-dark text-space-blue border-red-orange`;
  const classList = () => ({
    [classCommon]: true,
    [classPrimary]: !props.secondary,
    [classSecondary]: props.secondary,
    [props.class]: props.class,
    ...props.classList,
  });
  const a = () => <a classList={classList()} {...otherProps} />;
  const button = () => <button classList={classList()} {...otherProps} />;

  return <Dynamic component={otherProps.href ? a : button} />;
};

export default Button;
