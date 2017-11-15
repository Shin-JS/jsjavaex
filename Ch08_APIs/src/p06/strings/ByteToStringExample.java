package p06.strings;
/**[API]
 * 
 **/
public class ByteToStringExample {
	public static void main(String[] args) {
		byte[] bytes = {72,101,108,108,111,32,74,97,118,97};
		
		//String클래스의 생성자 String(값)
		//매개변수의 값이 문자열이 아닌 byte타입의 배열값도 매개변수로 올 수 있다.
		String str1 = new String(bytes);
		System.out.println(str1);
		
		String str2 = new String(bytes, 6, 4);
		System.out.println(str2);
	}
}
