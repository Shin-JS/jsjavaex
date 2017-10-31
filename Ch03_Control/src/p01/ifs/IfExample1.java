package p01.ifs;
/**
 * 제어문 - 조건문 - if문 
 * if()괄호안의 값이 true일때 실행
 * if() else문은 괄호안의 값이 true일때, if아래부분의 {}연산 실행, false일때 else아래부분의 {}연산 실행
 * if-else문은 주로 둘 중 하나를 선택해서 실행할때 사용
 * if문은 제어의 흐름을 임의로 바꿀 때 주로 사용
 **/
public class IfExample1 {
	public static void main(String[] args) {
		
		int a = -7;//로컬변수 선언
		if (a > 0) { //if()의 괄호안의 비교연산결과값이 true이면 {}안의 연산을 실행
			System.out.println(a+"는(은) 양수입니다.");
		}else { //if()의 괄호안의 비교연산결과값이 false이면 {}안의 연산을 실행
			System.out.println(a+"는(은) 음수입니다.");
		}
		
		if (a == -7) { //if()의 괄호안의 비교연산결과값이 true이면 {}안의 연산을 실행, false이면 {}안의 연산을 실행하지 않고 지나침
			System.out.println("a는" + a + "입니다.");
		}
	
	}
}
