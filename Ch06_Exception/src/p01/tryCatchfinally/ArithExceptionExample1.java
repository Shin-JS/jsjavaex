package p01.tryCatchfinally;
/**[예외처리]
*
**/
public class ArithExceptionExample1 {
	public static void main(String[] args) {
		int num = 100, result = 0;
		for (int i = 0; i < 10; i++) {
			int ran = (int)(Math.random()*10); //Math.random()의 범위는 0이상 1미만
			try { //발생된 오류를 처리하는 문장
			//예외발생을 방지(if-else문 사용)
//			if(ran==0) {
//				System.out.println("0으로 나눌 수 없습니다.");
//			}else {
				result = num/ran;
				System.out.println("num="+num);
				System.out.println("ran="+ran);
				System.out.println("result="+result);
//			}
			}catch(ArithmeticException e) {
				System.out.println(e.getMessage());
				System.out.println(ran);
				System.out.println("오류발생");
			}
		}
	}
}
