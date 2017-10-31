package p01.operations;
/**
 * 연산자
 * -.연산자에는 우선순위가 존재
 * -.()연산은 사칙연산에 우선 
 **/
public class OperExample1 {
	public static void main(String[] args) {
		int i = 5; 
		int j = 3;
		//사칙연산 ＋,－,×,÷ ←사칙연산보다 우선순위가 높은연산은 ()안에 있는 연산
		//문자열 + (사칙연산결과) ← expression
		//사칙연산 예시
		System.out.println("i × j = " + (i * j));
		System.out.println("i ÷ j = " + (i / j));
		System.out.println("i + j = " + (i + j));
		System.out.println("i - j = " + (i - j));
	}
}
