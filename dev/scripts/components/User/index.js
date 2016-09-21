import React from 'react'

export const User = (props) => {
    const user = props.children;
    const userPhone = user.phone ==="" ? "" : " +"+user.phone;
    return (
        <span>
            {`${user.firstName}:`}
            <span className="user-number">{userPhone}</span>
        </span>
    );
};
  // <a className="user-number" href="#">{`${user.phone}`}</a>
