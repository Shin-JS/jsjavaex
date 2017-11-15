package p04.reflection;
/**[API]
 * -.Class 클래스: 클래스의 정보를 담는 클래스
 * -.실행중인 클래스의 정보를 얻어오는 방법: reflection
 * -.getClass(): 클래스의 정보를 얻어오는 메소드
 * -.forName("클래스경로명");: 해당경로에 만들어져 있는 클래스를 메모리에 로딩하는 기능 
 * -.newInstance(): forName으로 로딩된 클래스를 instance화 시키는 메소드(new 클래스명();과 같은기능)
 **/
public class ClassExample {
	public static void main(String[] args) {
		Car car = new Car();
		Class clazz1 = car.getClass(); //getClass: 클래스의 정보를 획득하는 메소드(생성자,경로, 메소드 등등등등등)
		System.out.println(clazz1.getName());
		System.out.println(clazz1.getSimpleName());
		System.out.println(clazz1.getPackage().getName());
		System.out.println();
		String className = clazz1.getName();
		
		try {
			Class clazz2 = Class.forName(className); //이렇게 해도 됨
//			Class clazz2 = Class.forName("p04.reflection.Car"); //클래스경로를 스트링형태로 가져와서 사용
			System.out.println(clazz2.getName());
			System.out.println(clazz2.getSimpleName());
			System.out.println(clazz2.getPackage().getName());
		}catch(ClassNotFoundException e) {
			System.out.println(e.getMessage());
		}
	}
}
