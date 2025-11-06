import React from 'react';
import {
    Route,
    Redirect,
} from "react-router-dom";
import { connect } from 'react-redux';

function PrivateRoute({ children, ...rest }) {
    return (
        <Route
            {...rest}
            render={({ location }) =>
                rest.Auth.isLoggedIn ? (
                    children
                ) : (
                <Redirect
                    to={{
                        pathname: "/login",
                        state: { from: location }
                    }}
                />
                )
            }
        />
    );
}

const mapStateToProps = state => ({
    Auth : state.Auth
});

export default connect(mapStateToProps,{})(PrivateRoute);
