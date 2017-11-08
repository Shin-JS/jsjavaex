package p01.exceptions;
/**[예외처리]
 * -.main()함수의 String[]args는 가변형 배열, 입력되는 argument갯수에 따라 길이가 정해지는 특이한 배열
 **/
public class ArrayIndexOutOfBoundExceptionsExample {
	public static void main(String[] args) {
		try {
		String data1 = args[0];
		String data2 = args[1];
		
		//실행시 입력되는 값에 따라 정상처리 될 수도 있고, 예외가 발생 할 수도 있다.
		System.out.println("args[0]:" + data1);
		System.out.println("args[1]:" + data2);
		}catch(ArrayIndexOutOfBoundsException e) {
			System.out.println(e.getMessage()); //.getMessage()는 예외객체의 메세지를 받아서 출력하는 메소드
		}
	}
	
}
