export const BaseSvg = ({
  rate = 1,
  size = 20,
  auto,
  viewBox,
  children,
  ...props
}) => {
  const elProps = !auto
    ? {
        width: size * rate,
        height: size,
      }
    : {};

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      {...props}
      viewBox={viewBox}
      {...elProps}
    >
      {children}
    </svg>
  );
};
