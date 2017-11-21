package p01.lambdas;
/**
 * -.매개변수가 있는 추상메소드를 가진 함수적인터페이스
 **/
public class MyFucntionalInterfaceExample2 {
	public static void main(String[] args) {
		int a = 3;
		MyFunctionalInterface2 fi = new MyFunctionalInterface2() {
			
			@Override
			public void method(int x) {
				int result = x*5;
				System.out.println(result);
				
			}
		};
		fi.method(2);
		
		//람다식
		fi = (int x)->{
			int result = x*5;
			System.out.println(result);
						};
		fi.method(2);
		fi = (x) ->{
			System.out.println(x*5);
		};
		fi.method(2);
		
		fi = x -> System.out.println(x*5);
		fi.method(2);
		
	}
}
