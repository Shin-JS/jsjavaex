package p07.extends_implements;
/**[제네릭]
 *  -.상속, 구현
 *  -.제네릭타입의 상속 후 제네릭추가
 **/
public class ChildProduct<T,M,C> extends Product<T,M> {
	//필드
	private C company;
	public C getCompany() {
		return this.company;
	}
	public void setCompany(C company) {
		this.company = company;
	}
}
