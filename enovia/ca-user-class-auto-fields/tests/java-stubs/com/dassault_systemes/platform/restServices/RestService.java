package com.dassault_systemes.platform.restServices;
import matrix.db.Context;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.WebApplicationException;
public class RestService {
    public static Context nextContext;
    public static boolean deny;
    protected Context getAuthenticatedContext(HttpServletRequest request, boolean flag) {
        if (deny) throw new WebApplicationException(401);
        return nextContext;
    }
}
