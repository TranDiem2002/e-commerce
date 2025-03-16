import "./followed.scss";

const FollowedList = ({ listUser = [] }) => {
  return (
    <div className="followed-list-container">
      {listUser.map((user, key) => {
        return (
          <div id={user.userId} key={key} className="followed-user">
            <div className="followed-user-img__wrapper">
              <div className="followed-user-img">
                <img
                  src={`data:image/png;base64, ${user.base64Image}`}
                  alt=""
                />
              </div>
            </div>
            <div className="followed-user-name">{user.userName}</div>
          </div>
        );
      })}
    </div>
  );
};

export default FollowedList;
