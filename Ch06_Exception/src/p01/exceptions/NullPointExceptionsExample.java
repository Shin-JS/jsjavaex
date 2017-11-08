package p01.exceptions;
/**[예외처리]
 * -.RuntimeException
 **/
public class NullPointExceptionsExample {
	public static void main(String[] args) {
		//객체생성
		String data = null; //참조변수만 선언, null값을 참조
		System.out.println(data.toString());
	}
}
