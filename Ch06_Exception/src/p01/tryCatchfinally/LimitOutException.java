package p01.tryCatchfinally;
/**[예외처리]
*
**/
public class LimitOutException extends Exception {
	@Override
	public String getMessage() {
		
		return "가격의 변동폭이 너무 큽니다";
	}
}
