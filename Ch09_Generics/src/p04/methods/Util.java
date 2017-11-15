package p04.methods;
/**[제네릭]
 * -.제네릭메소드: <T>리턴타입<T>메소드명(파라미터){}
 **/
public class Util {//일반클래스
	//제네릭메소드
	public static<T> Box<T> boxing(T t){
		Box<T> box = new Box<>();
		box.set(t);
		return box;
		
	}
}
