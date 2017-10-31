package interfacePackage;

public class MyClass implements MyInterface, YourInterface {

	@Override  //컴파일러나 실행환경에 정보를 제공
	public int getRandomNumber() {
		
		return (int) Math.floor(Math.random() * 10);
	}

	@Override
	public int getCeilNumber(double number) {
		
		return (int) Math.ceil(number);
	}
	
	public void doSomething() {
		System.out.println("뭔일인가???");
	}

	@Override
	public void print() {
		
		
	}
	
	
	
}
