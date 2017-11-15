package p03.multi_generics;
/**[제네릭]
 *	-.multi - 서로다른 여러가지 타입을 대입해서 사용가능
 **/
public class Product<T,M,P> {
	//필드
	private T kind;
	private M model;
	private P price;
	private P qty;
	
	//메소드
	public T getKind() {
		return kind;
	}
	public void setKind(T kind) {
		this.kind = kind;
	}
	public M getModel() {
		return model;
	}
	public void setModel(M model) {
		this.model = model;
	}
	public P getPrice() {
		return price;
	}
	public void setPrice(P price) {
		this.price = price;
	}
	public P getQty() {
		return qty;
	}
	public void setQty(P qty) {
		this.qty = qty;
	}
	
}
class Car{}
class Tv{}


