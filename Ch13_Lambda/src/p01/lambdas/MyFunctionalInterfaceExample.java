package p01.lambdas;
/**
 * -.람다식 작성법: 
 *  1)매개타입은 런타임시에 대입값에 따라 자동 인식->생략 가능
 *  2)하나의 매개변수만 있을경우() 생략가능
 *  3)하나의 실행문만 있을때는 {} 생략가능
 *  4)매개변수가 없으면()반드시 표시
 *  5)리턴값이 있는경우, return표시
 *  6){return 문;]=>return으로 {}생략가능
 **/
public class MyFunctionalInterfaceExample {
	public static void main(String[] args) {
		MyFunctionalInterface fi;
		//익명구현체 생성(이 자체가 implements) = $1.class
		fi = new MyFunctionalInterface() {
			
			@Override
			public void method1() {
				String str = "method call1";
				System.out.println(str);
			}
		};
		fi.method1(); //익명구현체의 메소드 호출
		
		//람다식으로 표현시
		//람다식은 메소드명은 없고, 매개변수의 갯수가 중요
		fi = () ->{String str = "method call2"; //명령문1
					System.out.println(str); //명령문2
					}; //매개변수 없는 람다식
		fi.method1(); //람다식 메소드 호출
		//{}안에 명령문이 하나면 {}생략가능
		fi = ()->{System.out.println("method call3");}; //명령문1
		fi.method1();
		
		fi = ()->System.out.println("method call4");
		fi.method1();
		
		
	}
}
