package p01.operations;
/**
 * 조건연산(삼항연산자)
 * (조건식) ? 참:거짓 
 **/
public class OperExample5 {
	public static void main(String[] args) {
		int a = 20;
		int b = 30;
		int max;
		max = (a < b) ? a:b;
		System.out.println(max);
		
		//위의 삼항연산을 if문으로 풀어쓸 시
		if (a < b) {
			max = a;
		}else {
			max = b;
		}
		System.out.println(max);
		
		int score = 95;
		char grade = ' '; //char타입의 변수 초기화시 빈 문자로 초기화(' ')
						  //String에서 변수 초기화시 ""빈공백없이 가능
		if (score > 95) {
			grade = 'A';
		}else {
			grade = 'B';
		}
		System.out.println(grade);
		
		grade = (score > 95) ? 'A':'B';
		System.out.println(grade);
	}
}
