package interfacePackage;

public class MainClass {
	public static void main(String[] args) {
		
		MyInterface o1 = new YourClass();
		
		System.out.println(o1.getRandomNumber());
		System.out.println(o1.getCeilNumber(10.5));
//		o1.doSomething(); 타입이 MyInterface인경우 사용불가, MyClass인경우 사용가능
		
		
	}

}
