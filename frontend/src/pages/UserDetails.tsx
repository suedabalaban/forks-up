import {auth} from "../config/firebaseconfig";
import Button from "@mui/material/Button";

export const UserDetails = () => {


    return (
            <div>
                <Button onClick={() => {console.log(auth.currentUser?.toJSON())}}>
                    Click me pliz
                </Button>
                <p>User Details: {auth.currentUser?.email}</p>
            </div>
    );
}

