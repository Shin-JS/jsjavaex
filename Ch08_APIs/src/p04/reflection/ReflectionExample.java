package p04.reflection;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**[API]
 * -.실행중인 클래스의 정보(이름,생성자,메소드,필드)를 얻어와서 사용하는 방식 - reflection
 * -.Constructor클래스: 생성자 정보(getDeclaredConstructors();)
 * -.Method클래스: 선언된 메소드 정보(getDeclaredMethods();)
 * -.Fields클래스: 선언된 필드 정보(getDeclaredFields();)
 **/
public class ReflectionExample {
	public static void main(String[] args) {
		try {
		Class clazz = Class.forName("p04.reflection.Car");
		System.out.println("[클래스명]");
		System.out.println(clazz.getName());
		System.out.println("[생성자 정보]");
		Constructor[] constructors = clazz.getDeclaredConstructors();
		for (Constructor cons:constructors){
			System.out.print(cons.getName()+"(");
			Class[] params = cons.getParameterTypes();
			printParams(params); //파라미터 출력 메소드...만들어야 했다...
			System.out.println(")");
		}
		System.out.println();
		System.out.println("[필드 정보]");
		Field[] fields = clazz.getDeclaredFields();
		for(Field f:fields) {
			System.out.println(f.getType().getSimpleName()+"  " + f.getName());
		}
		System.out.println();
		System.out.println("[메소드 정보]");
		Method[] methods = clazz.getDeclaredMethods();
		for(Method m:methods) {
			System.out.print(m.getName()+"(");
			Class[] params = m.getParameterTypes();
			printParams(params);
			System.out.println(")");
		}
		}catch(ClassNotFoundException e) {
			System.out.println(e.getMessage());
		}
	}
	//Car(String name, String model,,,,,)
	private static void printParams(Class[] params) {
		for(int i = 0; i < params.length;i++) {
			System.out.print(params[i].getName());
			if(i < params.length-1) {
				System.out.println(",");
			}
		}
		
	}
}
