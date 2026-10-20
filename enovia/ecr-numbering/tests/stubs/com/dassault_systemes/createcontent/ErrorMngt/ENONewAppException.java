package com.dassault_systemes.createcontent.ErrorMngt;

/** Signature double only. Never deploy. */
public class ENONewAppException extends Exception {
    public enum ErrorCode { LEADING_APP_CREATE }
    public ENONewAppException(ErrorCode code, String message, String context, String detail) {
        super(message);
    }
}
