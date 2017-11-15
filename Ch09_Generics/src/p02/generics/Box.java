package p02.generics;
/**[제네릭]
 *  제네릭 타입 <T>: T타입만 대입가능
 **/
public class Box<T> {
	//필드
	private T t; //정해진 타입만 대입가능
	//생성자
	public Box() {}
	public Box(T t) {
		this.t = t;
	}
	//메소드
	public T get() {
		return t;
	}
	public void set(T t) {
		this.t = t;
	}
}
