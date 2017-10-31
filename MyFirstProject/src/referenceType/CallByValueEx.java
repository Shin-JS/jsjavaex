package referenceType;

public class CallByValueEx {
	public static void main(String[] args) {
		int a = 0;
		modify(a);
		System.out.println(a);
		
		MyClass b = new MyClass();//객체생성
		
		b.setName("Lisa");
		System.out.println(b.getName());
		
		modify(b);
		System.out.println(b.getName());//참조값이 같으면 같은 인스턴스
	}
	
	public static void modify(int i) {
		i = 3;
	}
	
	public static void modify(MyClass o) {
		o.setName("Jisu");
	}
}
