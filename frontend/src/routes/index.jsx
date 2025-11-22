import { Router } from "../router";
import { useRoutes } from "react-router-dom";

function AllRoutes (){
    const element = useRoutes(Router);
    return (
        <>
        {element}
        </>
    )
}
export default AllRoutes;
