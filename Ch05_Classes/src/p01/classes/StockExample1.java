package p01.classes;

public class StockExample1 {
	public static void main(String[] args) {
		Stock stock = new Stock("새우깡",1000);
		stock.inStock(100);
		stock.outStock(10);
		//리턴타입이 있는 메소드는 호출하면 결과값을 호출한 쪽으로 되돌려준다.
		//리턴값을 호출한쪽에 받아서 처리해도 되고 안받아도 됨 현재는 안받은경우
		System.out.println(stock.getGoodsName()+"  "+stock.getQty());
	}
}
