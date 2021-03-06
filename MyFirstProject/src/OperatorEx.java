
public class OperatorEx {
	public static void main(String[] args) {
		//산술연산자
				
		System.out.println(5.5 + 3.1415);
		System.out.println(5 * 3);
		System.out.println(5 - 3);
		System.out.println(5 / 3);
		System.out.println(5 % 3);
		
		//단항연산자
		int i = 1;
		i++;
		System.out.println(i);
		i--;
		System.out.println(i);
		boolean b = true;
		System.out.println(b);
		System.out.println(!b);
		
		//관계연산자
		System.out.println("관계연산자");
		System.out.println(3 == 3);
		System.out.println(3 != 3);
		System.out.println(3 > 3);
		System.out.println(3 >= 3);
		System.out.println(3 < 3);
		System.out.println(3 <= 3);
		
		//조건연산자(논리연산자)
		System.out.println("조건연산자 &&");
		System.out.println(true && true);
		System.out.println(false && true);
		System.out.println(true && false);
		System.out.println(false && false);
		
		System.out.println("조건연산자 ||");
		System.out.println(true || true);
		System.out.println(false || true);
		System.out.println(true || false);
		System.out.println(false || false);
		
		//비트연산자
		System.out.println("비트연산자");
		System.out.println(5&1);
		System.out.println(5|1);
		System.out.println(5>>1);
		System.out.println(5<<1);
		
	}
}
